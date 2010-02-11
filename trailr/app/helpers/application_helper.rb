# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  
  def default_javascript

    return '<script src="/javascripts/jquery-1.4.min.js"></script>
            <script src="/javascripts/jquery.livequery.js"></script>
            <script src="/javascripts/jquery.watermark.js"></script>
            <script src="/javascripts/jquery.ui.sortable.js"></script>
            <script src="/javascripts/json.js"></script>
            <script src="/javascripts/jquery.scrollTo.js"></script>
            



            <script src="/javascripts/application.js" type="text/javascript"></script>'

            #<script src="/javascripts/prototype.js" type="text/javascript"></script>
            #<script src="/javascripts/effects.js" type="text/javascript"></script>'
      
  end
  
  
end
