class SearchController < ApplicationController

  def results
    
    @trails = []
    
    if(params[:query])
      

      sql = <<-EOF 
      SELECT DISTINCT trails.* FROM trails 
        JOIN articles ON articles.trail_id = trails.id 
        LEFT JOIN users ON trails.user_id = users.id
      WHERE trails.draft = ? AND trails.hidden =? AND (trails.caption LIKE ? OR users.username LIKE ? OR articles.headline LIKE ? OR articles.source LIKE ? OR articles.url LIKE ?)
      ORDER BY trails.front DESC, trails.demoted ASC, trails.viewcount DESC, trails.created_at DESC
      EOF
      
      query = '%' + params[:query] + '%';
      page = params[:page] || 1
      
      @trails = Trail.paginate_by_sql([sql, false, false, query, query, query, query, query], :per_page => 7, :page => page) if params[:query]
      
    end
    
    respond_to do |format|
      format.html { render }
    end    
    
    
  end

end
