export interface Article {
  id: string
  title: string
  content: string
  authorId: string
  mainImgUrl: string
  createdAt: string
  updatedAt: string
  author: {
    fullName: string
  }
}

export interface ArticlesResponse {
  message: string
  data: Article[]
  pagination: {
    total: number
    skip: number
    limit: number
    hasMore: boolean
  }
}

export interface ArticleResponse {
  message: string
  data: Article
}
