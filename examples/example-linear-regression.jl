# # Linear regression

# Import the necessary packages:

using Distributions
using MLJBase
using Soss
using SossMLJ
using Statistics

# In this example, we fit a Bayesian linear regression model with the
# canonical link function.

# Suppose that we are given a matrix of features `X` and a column vector of
# labels `y`. `X` has `n` rows and `p` columns. `y` has `n` elements. We assume
# that our observation vector `y` is a realization of a random variable `Y`.
# We define `μ` (mu) as the expected value of `Y`, i.e. `μ := E[Y]`. Our model
# comprises three components:
#
# 1. The probability distribution of `Y`: for linear regression, we assume that each `Yᵢ` follows a normal distribution with mean `μᵢ` and variance `σ²`.
# 2. The systematic component, which consists of linear predictor `η` (eta), which we define as `η := Xβ`, where `β` is the column vector of `p` coefficients.
# 3. The link function `g`, which provides the following relationship: `g(E[Y]) = g(μ) = η = Xβ`. It follows that `μ = g⁻¹(η)`, where `g⁻¹` denotes the inverse of `g`. For linear regression, the canonical link function is the identity function. Therefore, when using the canonical link function, `μ = g⁻¹(η) = η`.
#
# In this model, the parameters that we want to estimate are `β` and `σ`.
# We need to select prior distributions for these parameters. For each `βᵢ`
# we choose a normal distribution with zero mean and variance `s²`. Here, `βᵢ`
# denotes the `i`th component of `β`. For `σ`, we will choose a half-normal
# distribution with variance `t²`. `s` and `t` are hyperparameters that we will
# need to choose.

# We define this model using the Soss probabilistic programming library:

m = @model X, s, t begin
    p = size(X, 2) # number of features
    β ~ Normal(0, s) |> iid(p) # coefficients
    σ ~ HalfNormal(t) # dispersion
    η = X * β # linear predictor
    μ = η # `μ = g⁻¹(η) = η`
    y ~ For(eachindex(μ)) do j
        Normal(μ[j], σ) # `Yᵢ ~ Normal(mean=μᵢ, variance=σ²)`
    end
end;

# Generate some synthetic features. Let us generate two continuous
# features and two binary categorical features.

num_rows = 1_000
x1 = randn(num_rows)
x2 = randn(num_rows)
x3 = Int.(rand(num_rows) .> 0.5)
x4 = Int.(rand(num_rows) .> 0.5)
X = (x1 = x1, x2 = x2, x3 = x3, x4 = x4)

# Define the hyperparameters of our prior distributions:

hyperparams = (s=0.1, t=0.1)

# Convert the Soss model into a `SossMLJModel`:

model = SossMLJModel(;
    model       = m,
    hyperparams = hyperparams,
    infer       = dynamicHMC,
    response    = :y,
);

# Generate some synthetic labels:

args = merge(model.transform(X), hyperparams)
truth = rand(m(args))

# Create an MLJ machine for fitting our model:

mach = MLJBase.machine(model, X, truth.y)

# Fit the machine. This may take several minutes.

fit!(mach)

# Construct the posterior distribution and the joint posterior predictive distribution:

predictor_joint = predict_joint(mach, X)
typeof(predictor_joint)

# Draw a single sample from the joint posterior predictive distribution:

single_sample = rand(predictor_joint; response = :y)

# Evaluate the logpdf of the joint posterior predictive distribution at this sample:

logpdf(predictor_joint, single_sample)

# True `β`:

truth.β

# Posterior distribution of `β`

predict_particles(mach, X; response = :β)

# Difference between the posterior distribution of `β` to the true values:

truth.β - predict_particles(mach, X; response = :β)

# Compare the joint posterior predictive distribution of `μ` to the true values:

truth.μ - predict_particles(mach, X; response = :μ)

# Compare the joint posterior predictive distribution of `y` to the true values:

truth.y - predict_particles(mach, X; response = :y)

# Construct each of the marginal posterior predictive distributions:

predictor_marginal = MLJBase.predict(mach, X)
typeof(predictor_marginal)

# `predictor_marginal` has one element for each row in `X`

size(predictor_marginal)

# Draw a single sample from each of the marginal posterior predictive distributions:

only.(rand.(predictor_marginal))

# Use cross-validation to evaluate the model with respect to the expected value of the root mean square error (RMSE)

evaluate!(mach, resampling=CV(; nfolds = 6, shuffle = true), measure=rms_expected, operation=predict_particles)

# Use cross-validation to evaluate the model with respect to the median of the root mean square error (RMSE)

evaluate!(mach, resampling=CV(; nfolds = 6, shuffle = true), measure=rms_median, operation=predict_particles)
