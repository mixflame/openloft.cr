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
    get "/", LivepixelController, :canvas
    post "/upload_to_imgur", LivepixelController, :upload_to_imgur
    get "/gallery", LivepixelController, :gallery
    get "/clear_canvas", LivepixelController, :clear_canvas
    get "/stats", LivepixelController, :stats
    get "/privacy_policy", LivepixelController, :privacy_policy
    get "/buy_ad", LivepixelController, :buy_ad
    post "/create_order", LivepixelController, :create_order
    post "/capture_order", LivepixelController, :capture_order
  end

  routes :api do
  end

  routes :static do
    # Each route is defined as follow
    # verb resource : String, controller : Symbol, action : Symbol
    get "/*", Amber::Controller::Static, :index
  end
end
