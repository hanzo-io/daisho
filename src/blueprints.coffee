sp = (u) ->
  (x) ->
    if isFunction u
      url = u x
    else
      url = u

    if @storeId?
      "/store/#{@storeId}" + url
    else
      url

byId = (name) ->
  switch name
    when 'coupon'
      sp (x) -> "/coupon/#{x.code ? x}"
    # when 'collection'
    #   sp (x) -> "/collection/#{x.slug ? x}"
    when 'product'
      sp (x) -> "/product/#{x.id ? x.slug ? x}"
    # when 'variant'
    #   sp (x) -> "/variant/#{x.id ? x.sku ? x}"
    when 'user'
      sp (x) -> "/user/#{x.id ? x.email ? x}"
    # when 'site'
    #   (x) -> "/site/#{x.id ? x.name ? x}"
    else
      (x) -> "/#{name}/#{x.id ? x}"

createBlueprint = (name) ->
  endpoint = "/#{name}"

  list:
    url:    endpoint
    method: 'GET'
  get:
    url:    byId name
    method: 'GET'
  create:
    url:    byId name
    method: 'POST'
  update:
    url:    byId name
    method: 'PATCH'

blueprints =
  oauth:
    auth:
      # expects: statusOk
      method:   'POST'
      url:      '/auth'

  account:
    organization:
      method:   'GET'
      url:      '/_/account/organizations'

  dashv2:
    login:
      method:   'POST'
      url:      '/dashv2/login'

  counter:
    search:
      method:   'POST'
      url:      '/counter'

models = [
  'user'
]

for model in models
  do (model) ->
    blueprints[model] = createBlueprint model

module.exports = blueprints
