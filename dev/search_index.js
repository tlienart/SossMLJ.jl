var documenterSearchIndex = {"docs":
[{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"EditURL = \"https://github.com/cscherrer/SossMLJ.jl/blob/master/examples/example-multinomial-logistic-regression.jl\"","category":"page"},{"location":"example-multinomial-logistic-regression/#Multinomial-logistic-regression","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"","category":"section"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"Import the necessary packages:","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"using DataFrames\nusing Distributions\nusing MLJBase\nusing NNlib\nusing RDatasets\nusing Soss\nusing SossMLJ\nusing Statistics","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"In this example, we fit a Bayesian multinomial logistic regression model with the canonical link function.","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"Suppose that we are given a matrix of features X and a column vector of labels y. X has n rows and p columns. y has n elements. We assume that our observation vector y is a realization of a random variable Y. We define μ (mu) as the expected value of Y, i.e. μ := E[Y]. Our model comprises three components:","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"The probability distribution of Y. We assume that each Yᵢ follows a","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"multinomial distribution with k categories, mean μᵢ, and one trial. A multinomial distribution with one trial is equivalent to the categorical distribution. Therefore, these two statements are equivalent:","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"Yᵢ follows a multinomial distribution with k categories, mean μᵢ, and one trial.\nYᵢ follows a categorical distribution with k categories and mean μᵢ.","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"In the special case of two categories, i.e. k = 2, the multinomial distribution reduces to the binomial distribution, the categorical distribution reduces to the Bernoulli distribution, and the  multinomial logistic regression model reduces to the logistic regression model.","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"The systematic component, which consists of linear predictor η (eta),","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"which we define as η := Xβ, where β is the column vector of p coefficients.","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"The link function g, which provides the following relationship:","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"g(E[Y]) = g(μ) = η = Xβ. It follows that μ = g⁻¹(η), where g⁻¹ denotes the inverse of g. Recall that in logistic regression, the canonical link function was the logit function, and the inverse of the logit function was the sigmoidal logistic function. In multinomial logistic regression, the canonical link function is the generalized logit function (which is a generalization of the logit function). The inverse of the generalized logit function is the softmax function (which is a generalization of the sigmoidal logistic function). Therefore, when using the canonical link function, μ = g⁻¹(η) = softmax(η).","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"In this model, the parameters that we want to estimate are the coefficients β. We need to select prior distributions for these parameters. For each βᵢ we choose a normal distribution with zero mean and unit variance. Here,βᵢdenotes theith component ofβ`.","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"We define this model using the Soss probabilistic programming library:","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"m = @model X,pool begin\n    n = size(X,1) # number of observations\n    p = size(X,2) # number of features\n    k = length(pool.levels) # number of classes\n    β ~ Normal(0.0, 1.0) |> iid(p, k) # coefficients\n    η = X * β # linear predictor\n    μ = NNlib.softmax(η; dims=2) # μ = g⁻¹(η) = softmax(η)\n    y_dists = UnivariateFinite(pool.levels, μ; pool=pool) # `UnivariateFinite` is mathematically equivalent to `Categorical`\n    y ~ For(j -> y_dists[j], n) # `Yᵢ ~ UnivariateFinite(mean=μᵢ, categories=k)`, which is mathematically equivalent to `Yᵢ ~ Categorical(mean=μᵢ, categories=k)`\nend;\nnothing #hide","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"Import the Iris flower data set:","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"iris = dataset(\"datasets\", \"iris\");\nnothing #hide","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"Define our feature columns:","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"feature_columns = [\n    :PetalLength,\n    :PetalWidth,\n    :SepalLength,\n    :SepalWidth,\n]","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"Define our label column:","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"label_column = :Species","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"Convert the Soss model into a SossMLJModel:","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"model = SossMLJModel(m;\n    hyperparams = (pool=iris.Species.pool,),\n    transform   = tbl -> (X=MLJBase.matrix(tbl[!, feature_columns]),),\n    infer       = dynamicHMC,\n    response    = :y,\n);\nnothing #hide","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"Create an MLJ machine for fitting our model:","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"mach = MLJBase.machine(model, iris[!, feature_columns], iris[!, :Species])","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"Fit the machine. This may take several minutes.","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"MLJBase.fit!(mach)","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"Construct the posterior:","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"predictor_joint = MLJBase.predict_joint(mach, iris[!, feature_columns])\ntypeof(predictor_joint)","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"Draw a sample from the posterior:","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"single_sample = rand(predictor_joint)","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"","category":"page"},{"location":"example-multinomial-logistic-regression/","page":"Multinomial logistic regression","title":"Multinomial logistic regression","text":"This page was generated using Literate.jl.","category":"page"},{"location":"api/#API","page":"API","title":"API","text":"","category":"section"},{"location":"api/","page":"API","title":"API","text":"","category":"page"},{"location":"api/","page":"API","title":"API","text":"Modules = [SossMLJ]","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"EditURL = \"https://github.com/cscherrer/SossMLJ.jl/blob/master/examples/example-linear-regression.jl\"","category":"page"},{"location":"example-linear-regression/#Linear-regression","page":"Linear regression","title":"Linear regression","text":"","category":"section"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Import the necessary packages:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"using Distributions\nusing MLJBase\nusing Soss\nusing SossMLJ\nusing Statistics","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"In this example, we fit a Bayesian linear regression model with the canonical link function.","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Suppose that we are given a matrix of features X and a column vector of labels y. X has n rows and p columns. y has n elements. We assume that our observation vector y is a realization of a random variable Y. We define μ (mu) as the expected value of Y, i.e. μ := E[Y]. Our model comprises three components:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"The probability distribution of Y: for linear regression, we assume that each Yᵢ follows a normal distribution with mean μᵢ and variance σ².\nThe systematic component, which consists of linear predictor η (eta), which we define as η := Xβ, where β is the column vector of p coefficients.\nThe link function g, which provides the following relationship: g(E[Y]) = g(μ) = η = Xβ. It follows that μ = g⁻¹(η), where g⁻¹ denotes the inverse of g. For linear regression, the canonical link function is the identity function. Therefore, when using the canonical link function, μ = g⁻¹(η) = η.","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"In this model, the parameters that we want to estimate are β and σ. We need to select prior distributions for these parameters. For each βᵢ we choose a normal distribution with zero mean and variance s². Here, βᵢ denotes the ith component of β. For σ, we will choose a half-normal distribution with variance t². s and t are hyperparameters that we will need to choose.","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"We define this model using the Soss probabilistic programming library:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"m = @model X, s, t begin\n    p = size(X, 2) # number of features\n    β ~ Normal(0, s) |> iid(p) # coefficients\n    σ ~ HalfNormal(t) # dispersion\n    η = X * β # linear predictor\n    μ = η # `μ = g⁻¹(η) = η``\n    y ~ For(eachindex(μ)) do j\n        Normal(μ[j], σ) # `Yᵢ ~ Normal(mean=μᵢ, variance=σ²)`\n    end\nend;\nnothing #hide","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Generate some synthetic features. Let us generate two continuous features and two binary categorical features.","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"num_rows = 100\nx1 = randn(num_rows)\nx2 = randn(num_rows)\nx3 = Int.(rand(num_rows) .> 0.5)\nx4 = Int.(rand(num_rows) .> 0.5)\nX = (x1 = x1, x2 = x2, x3 = x3, x4 = x4)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Define the hyperparameters of our prior distributions:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"hyperparams = (s=0.1, t=0.1)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Convert the Soss model into a SossMLJModel:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"model = SossMLJModel(m;\n    hyperparams = hyperparams,\n    transform   = X -> (X=matrix(X),),\n    infer       = dynamicHMC,\n    response    = :y,\n);\nnothing #hide","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Generate some synthetic labels:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"args = merge(model.transform(X), hyperparams)\ntruth = rand(m(args))","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Create an MLJ machine for fitting our model:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"mach = MLJBase.machine(model, X, truth.y)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Fit the machine. This may take several minutes.","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"fit!(mach)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Construct the posterior distribution and the joint posterior predictive distribution:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"predictor_joint = predict_joint(mach, X)\ntypeof(predictor_joint)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Draw a single sample from the joint posterior predictive distribution:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"single_sample = rand(predictor_joint; response = :y)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Evaluate the logpdf of the joint posterior predictive distribution at this sample:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"logpdf(predictor_joint, single_sample)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"True β:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"truth.β","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Posterior distribution of β","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"predict_particles(mach, X; response = :β)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Difference between the posterior distribution of β to the true values:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"truth.β - predict_particles(mach, X; response = :β)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Compare the joint posterior predictive distribution of μ to the true values:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"truth.μ - predict_particles(mach, X; response = :μ)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Compare the joint posterior predictive distribution of y to the true values:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"truth.y - predict_particles(mach, X; response = :y)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Construct each of the marginal posterior predictive distributions:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"predictor_marginal = MLJBase.predict(mach, X)\ntypeof(predictor_marginal)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"predictor_marginal has one element for each row in X","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"size(predictor_marginal)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Draw a single sample from each of the marginal posterior predictive distributions:","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"only.(rand.(predictor_marginal))","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Use cross-validation to evaluate the model with respect to the expected value of the root mean square error (RMSE)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"evaluate!(mach, resampling=CV(), measure=rms_expected, operation=predict_particles)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"Use cross-validation to evaluate the model with respect to the median of the root mean square error (RMSE)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"evaluate!(mach, resampling=CV(), measure=rms_median, operation=predict_particles)","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"","category":"page"},{"location":"example-linear-regression/","page":"Linear regression","title":"Linear regression","text":"This page was generated using Literate.jl.","category":"page"},{"location":"#SossMLJ.jl","page":"Home","title":"SossMLJ.jl","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"SossMLJ integrates the Soss probabilistic programming library into the MLJ machine learning framework.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The source code is available in the GitHub repository.","category":"page"}]
}
