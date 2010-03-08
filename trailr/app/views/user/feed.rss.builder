xml.instruct! :xml, :version => "1.0"
xml.rss :version => "2.0" do
  xml.channel do
    xml.title "LineHive.com / #{@user.username}"
    xml.description "#{@user.username}'s timelines"
    xml.link url_for :controller => "user", :action => "profile", :username => "#{@user.username}"

    for trail in @trails
      xml.item do
        xml.title trail.caption
        #xml.description post.content
        xml.pubDate trail.created_at.to_s(:rfc822)
        xml.link url_for :controller => "trails", :action => "show", :id => trail.id
      end
    end
  end
end