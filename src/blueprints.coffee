import isFunction from 'es-is/function'

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

statusOk        = (res) -> res.status is 200
statusCreated   = (res) -> res.status is 201
statusNoContent = (res) -> res.status is 204

# Complete RESTful API available with secret key, so all methods are
# exposed in server environment.
createBlueprint = (name) ->
  endpoint = "/#{name}"

  url = byId name

  list:
    url:    endpoint
    method: 'GET'
  get:
    url:     url
    method:  'GET'
    expects: statusOk
  create:
    url:     endpoint
    method:  'POST'
    expects: statusCreated
  update:
    url:     url
    method:  'PATCH'
    expects: statusOk
  delete:
    url:     url
    method:  'DELETE'
    expects: statusNoContent

blueprints =
  oauth:
    auth:
      # expects: statusOk
      method: 'POST'
      url:    '/auth'

  account:
    organization:
      method: 'GET'
      url:    '/_/account/organizations'

  dashv2:
    login:
      method: 'POST'
      url:    '/dashv2/login'

  counter:
    search:
      method: 'POST'
      url:    '/counter'

  library:
    daisho:
      method: 'GET'
      url:    '/library/daisho'

models = [
  'user'
  'order'
  'product'
  'note'
  'wallet'
]

for model in models
  do (model) ->
    blueprints[model] = createBlueprint model

blueprints.note.search =
  method: 'POST'
  url:    '/search/note'

blueprints.user.orders =
  method: 'GET'
  url:    (x) -> "/user/#{x.id ? x}/orders"
  expects:  statusOk

blueprints.user.transactions =
  method: 'GET'
  url:    (x) -> "/user/#{x.id ? x}/transactions"
  expects:  statusOk

blueprints.user.referrals =
  method: 'GET'
  url:    (x) -> "/user/#{x.id ? x}/referrals"
  expects:  statusOk

blueprints.user.referrers =
  method: 'GET'
  url:    (x) -> "/user/#{x.id ? x}/referrers"
  expects:  statusOk

blueprints.user.resetPassword =
  method: 'GET'
  url:    (x) -> "/user/#{x.id ? x}/password/reset"
  expects:  statusOk

blueprints.user.wallet =
  method: 'GET'
  url:    (x) -> "/user/#{x.id ? x}/wallet"
  expects:  statusOk

blueprints.transaction =
  create:
    url:     '/transaction'
    method:  'POST'
    expects: statusCreated

blueprints.library.daisho =
  url:     '/library/daisho'
  method:  'POST'
  expects: statusOk

blueprints.order.sendOrderConfirmation =
  method: 'GET'
  url:    (x) -> "/order/#{x.id ? x}/sendorderconfirmation"
  expects:  statusNoContent

blueprints.order.sendRefundConfirmation =
  method: 'GET'
  url:    (x) -> "/order/#{x.id ? x}/sendrefundconfirmation"
  expects:  statusNoContent

blueprints.order.sendFulfillmentConfirmation =
  method: 'GET'
  url:    (x) -> "/order/#{x.id ? x}/sendfulfillmentconfirmation"
  expects:  statusNoContent

blueprints.order.payments =
  method: 'GET'
  url:    (x) -> "/order/#{x.id ? x}/payments"
  expects:  statusOk

export default blueprints
