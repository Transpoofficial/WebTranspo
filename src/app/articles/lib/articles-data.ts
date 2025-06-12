interface Article {
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
  
  interface ArticlesResponse {
    message: string
    data: Article[]
    pagination: {
      total: number
      skip: number
      limit: number
      hasMore: boolean
    }
  }
  
  interface ArticleResponse {
    message: string
    data: Article
  }
  
  // Mock data
  const mockArticles: Article[] = [
    {
      id: "cmbrx84du0001evo4qddj4fks",
      title: "Judul artikel 1",
      content:
        "Konten artikel 1\r\n\r\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\r\n\r\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      authorId: "cmbrvkpfv0000evl8nekxjly8",
      mainImgUrl:
        "https://atofjdakcdpmetccupvn.supabase.co/storage/v1/object/public/testing/uploads/articles/1749644607507.jpg",
      createdAt: "2025-06-11T12:23:28.716Z",
      updatedAt: "2025-06-11T12:23:28.716Z",
      author: {
        fullName: "admin1",
      },
    },
    {
      id: "cmbrx84du0001evo4qddj4fkt",
      title: "Panduan Lengkap React Development",
      content:
        "React adalah library JavaScript yang powerful untuk membangun user interface.\r\n\r\nDalam artikel ini, kita akan membahas konsep-konsep dasar React seperti components, props, state, dan hooks. React memungkinkan developer untuk membuat aplikasi web yang interaktif dan responsif dengan mudah.\r\n\r\nBeberapa keunggulan React:\r\n- Virtual DOM untuk performa yang optimal\r\n- Component-based architecture\r\n- Large ecosystem dan community support\r\n- Reusable components",
      authorId: "cmbrvkpfv0000evl8nekxjly9",
      mainImgUrl: "/placeholder.svg?height=400&width=600",
      createdAt: "2025-06-10T10:15:30.500Z",
      updatedAt: "2025-06-10T10:15:30.500Z",
      author: {
        fullName: "John Developer",
      },
    },
    {
      id: "cmbrx84du0001evo4qddj4fku",
      title: "Tips Optimasi Performance Web",
      content:
        "Performance adalah salah satu faktor terpenting dalam pengembangan web modern.\r\n\r\nBeberapa teknik optimasi yang bisa diterapkan:\r\n\r\n1. **Image Optimization**: Gunakan format gambar yang tepat dan compress images\r\n2. **Code Splitting**: Bagi kode menjadi chunks yang lebih kecil\r\n3. **Lazy Loading**: Load content hanya ketika dibutuhkan\r\n4. **Caching Strategy**: Implementasi caching yang efektif\r\n5. **Minification**: Compress CSS, JS, dan HTML files\r\n\r\nDengan menerapkan teknik-teknik ini, website Anda akan memiliki loading time yang lebih cepat dan user experience yang lebih baik.",
      authorId: "cmbrvkpfv0000evl8nekxjly10",
      mainImgUrl: "/placeholder.svg?height=400&width=600",
      createdAt: "2025-06-09T14:30:45.200Z",
      updatedAt: "2025-06-09T14:30:45.200Z",
      author: {
        fullName: "Sarah Performance",
      },
    },
  ]
  
  export async function getArticles(skip = 0, limit = 10): Promise<ArticlesResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))
  
    const paginatedArticles = mockArticles.slice(skip, skip + limit)
    const total = mockArticles.length
    const hasMore = skip + limit < total
  
    return {
      message: "Articles retrieved successfully",
      data: paginatedArticles,
      pagination: {
        total,
        skip,
        limit,
        hasMore,
      },
    }
  }
  
  export async function getArticleById(id: string): Promise<ArticleResponse | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))
  
    const article = mockArticles.find((article) => article.id === id)
  
    if (!article) {
      return null
    }
  
    return {
      message: "Article retrieved successfully",
      data: article,
    }
  }
  