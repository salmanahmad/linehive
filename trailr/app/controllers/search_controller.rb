class SearchController < ApplicationController

  def results
    
    @trails = []
    
    if(params[:query])
      
      
      sql = <<-EOF 
      SELECT DISTINCT trails.* FROM trails 
        JOIN articles ON articles.trail_id = trails.id 
        LEFT JOIN users ON trails.user_id = users.id
      WHERE trails.caption LIKE ? OR users.handle LIKE ? OR articles.headline LIKE ? OR articles.source LIKE ? OR articles.url LIKE ?
      ORDER BY viewcount DESC, created_at DESC;
      EOF
      
      query = '%' + params[:query] + '%';
      
      @trails = Trail.find_by_sql([sql, query, query, query, query, query ]) if params[:query]
      
    end
    
    respond_to do |format|
      format.html { render }
    end    
    
    
  end

end
