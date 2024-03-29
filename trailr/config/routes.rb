ActionController::Routing::Routes.draw do |map|
  # The priority is based upon order of creation: first created -> highest priority.

  # Sample of regular route:
  #   map.connect 'products/:id', :controller => 'catalog', :action => 'view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   map.purchase 'products/:id/purchase', :controller => 'catalog', :action => 'purchase'
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   map.resources :products

  # Sample resource route with options:
  #   map.resources :products, :member => { :short => :get, :toggle => :post }, :collection => { :sold => :get }

  # Sample resource route with sub-resources:
  #   map.resources :products, :has_many => [ :comments, :sales ], :has_one => :seller
  
  # Sample resource route with more complex sub-resources
  #   map.resources :products do |products|
  #     products.resources :comments
  #     products.resources :sales, :collection => { :recent => :get }
  #   end

  # Sample resource route within a namespace:
  #   map.namespace :admin do |admin|
  #     # Directs /admin/products/* to Admin::ProductsController (app/controllers/admin/products_controller.rb)
  #     admin.resources :products
  #   end

  # You can have the root of your site routed with map.root -- just remember to delete public/index.html.
  # map.root :controller => "welcome"

  # See how all your routes lay out with "rake routes"

  # Install the default routes as the lowest priority.
  # Note: These default routes make all actions in every controller accessible via GET requests. You should
  # consider removing or commenting them out if you're using named routes and resources.



  map.connect '/', :controller => "trails", :action => "index"
  map.connect 'recent', :controller => "trails", :action => "recent"
  map.connect 'popular', :controller => "trails", :action => "popular"
  #map.connect '/', :controller => "home", :action => "index"
  
  map.connect '/search', :controller => "search", :action => "results"
  map.connect 'about', :controller => "home", :action => "about"
  map.connect 'team', :controller => "home", :action => "team"
  map.connect 'jetpack', :controller => "home", :action => "jetpack"
  map.connect 'featured.:format', :controller => "home", :action => "featured"
  
  map.connect 'create', :controller => "trails", :action => "new"
  map.connect 'fullscreen/:id', :controller => "trails", :action => "fullscreen"
  map.connect 'embed/:id', :controller => "trails", :action => "embed"
  map.connect 'show/:id', :controller => "trails", :action => "show"
  
  #map.connect ':id', :controller => "trails", :action => "show"
  
  map.connect 'api/:action/:query', :controller => "api"
  
  map.connect 'home', :controller => "home", :action => "index"
  map.connect 'feedback', :controller => "feedback", :action => "index"
  
  map.connect 'admin/:action/:id', :controller => "admin"
  
  map.connect ':username', :controller => "user", :action => "profile"
  map.connect ':username/lines.:format', :controller => "user", :action => "feed"
  
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'


end
