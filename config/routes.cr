Amber::Server.configure do
  pipeline :web do
    # Plug is the method to use connect a pipe (middleware)
    # A plug accepts an instance of HTTP::Handler
    # plug Amber::Pipe::PoweredByAmber.new
    # plug Amber::Pipe::ClientIp.new(["X-Forwarded-For"])
    plug Citrine::I18n::Handler.new
    plug Amber::Pipe::Error.new
    plug Amber::Pipe::Logger.new
    plug Amber::Pipe::Session.new
    plug Amber::Pipe::Flash.new
    plug Amber::Pipe::CSRF.new
  end

  pipeline :api do
    # plug Amber::Pipe::PoweredByAmber.new
    plug Amber::Pipe::Error.new
    plug Amber::Pipe::Logger.new
    plug Amber::Pipe::Session.new
    plug Amber::Pipe::CORS.new
  end

  # All static content will run these transformations
  pipeline :static do
    # plug Amber::Pipe::PoweredByAmber.new
    plug Amber::Pipe::Error.new
    plug Amber::Pipe::Static.new("./public")
  end

  routes :web do
    post "/sessions", SessionsController, :create
    websocket "/session", SessionSocket
    websocket "/chat", ChatSocket
    websocket "/persistence", PersistenceSocket
    websocket "/canvas", CanvasSocket
    websocket "/text", TextSocket
    get "/canvas", LivepixelController, :canvas
    post "/upload_to_imgur", LivepixelController, :upload_to_imgur
    post "/upload_to_scalable_press", LivepixelController, :upload_to_scalable_press
    get "/show_scalable_product_categories", LivepixelController, :show_scalable_product_categories
    get "/show_scalable_products", LivepixelController, :show_scalable_products
    post "/get_scalable_quote", LivepixelController, :get_scalable_quote
    get "/show_scalable_mockup", LivepixelController, :show_scalable_mockup
    # get "/place_scalable_order", LivepixelController, :place_scalable_order
    get "/gallery", LivepixelController, :gallery
    get "/gallery_feed", LivepixelController, :gallery_feed
    get "/clear_canvas", LivepixelController, :clear_canvas
    get "/stats", LivepixelController, :stats
    get "/privacy_policy", LivepixelController, :privacy_policy
    get "/buy_ad", LivepixelController, :buy_ad
    post "/create_order", LivepixelController, :create_order
    post "/capture_order", LivepixelController, :capture_order
    post "/upload", LivepixelController, :upload
    get "/active_users", LivepixelController, :active_users
    get "/", LivepixelController, :landing
    get "/random_ad", LivepixelController, :random_ad
  end

  routes :api do
  end

  routes :static do
    # Each route is defined as follow
    # verb resource : String, controller : Symbol, action : Symbol
    get "/*", Amber::Controller::Static, :index
  end
end
