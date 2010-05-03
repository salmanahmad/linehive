class Notifier < ActionMailer::Base
  
  def new_timeline_notification(trail)
    recipients "team@linehive.com"
    from       "team@linehive.com"
    subject    "LineHive Notifier: New timeline created"
    body       :trail => trail
  end
  

end
