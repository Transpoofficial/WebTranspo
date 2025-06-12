import axios from 'axios'
import { ArticleResponse, ArticlesResponse } from '../types/article'

interface PaginationParams {
  skip?: number;
  limit?: number;
}

export const articlesService = {
  getArticles: async (params: PaginationParams = {}): Promise<ArticlesResponse> => {
    const searchParams = new URLSearchParams();
    if (params.skip) searchParams.append('skip', params.skip.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await fetch(`/api/articles?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return response.json();
  },

  getArticleById: async (id: string): Promise<ArticleResponse> => {
    const { data } = await axios.get<ArticleResponse>(`/api/articles/${id}`)
    return data
  }
}
