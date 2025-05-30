import axios from 'axios';

// API configuration
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || 'd0riqhhr01qumepefum0d0riqhhr01qumepefumg';

// Perplexity Sonar API client
const perplexityClient = axios.create({
  baseURL: 'https://api.perplexity.ai',
  headers: {
    'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Finnhub API client
const finnhubClient = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  params: {
    token: FINNHUB_API_KEY, // Finnhub requires the token as a query parameter
  },
});

// Perplexity Sonar API functions
export const analyzeSentiment = async (text: string) => {
  if (!PERPLEXITY_API_KEY) {
    console.warn('Perplexity API key not found, using mock data');
    return mockSentimentAnalysis(text);
  }

  try {
    const response = await perplexityClient.post('/chat/completions', {
      model: 'mixtral-8x7b-instruct',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the following text and provide insights relevant to financial markets.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from Perplexity API');
    }

    return response.data;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return mockSentimentAnalysis(text);
  }
};

// Mock sentiment analysis for fallback
const mockSentimentAnalysis = (text: string) => {
  const randomSentiment = Math.random();
  let sentiment;
  
  if (randomSentiment > 0.6) sentiment = 'positive';
  else if (randomSentiment > 0.3) sentiment = 'neutral';
  else sentiment = 'negative';
  
  return {
    choices: [{
      message: {
        content: `The sentiment of this text appears to be ${sentiment}.`
      }
    }]
  };
};

// Generate mock news data
const generateMockNews = (count: number) => {
  const sources = ['Bloomberg', 'Reuters', 'Financial Times', 'Wall Street Journal', 'CNBC'];
  const headlines = [
    'Wayne Enterprises Announces Revolutionary Clean Energy Initiative',
    'Global Markets Rally on Tech Sector Gains',
    'Federal Reserve Signals Potential Rate Changes',
    'Emerging Markets Show Strong Growth Potential',
    'Cybersecurity Concerns Rise in Financial Sector',
    'New Regulations Impact Banking Industry',
    'AI Adoption Accelerates in Financial Services',
    'Market Volatility Increases Amid Global Tensions',
    'Sustainable Investing Trends Gain Momentum',
    'Digital Currency Developments Shape Financial Landscape'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `news-${i}`,
    headline: headlines[i % headlines.length],
    source: sources[Math.floor(Math.random() * sources.length)],
    datetime: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
    url: '#',
    sentiment: Math.random() > 0.5 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative',
    relevance: Math.floor(Math.random() * 30) + 70
  }));
};

// Finnhub API functions with mock fallback
export const getMarketNews = async () => {
  try {
    const response = await finnhubClient.get('/news', {
      params: {
        category: 'general'
      }
    });
    
    if (!response.data || response.data.error) {
      throw new Error('Invalid response from Finnhub API');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching market news:', error);
    return generateMockNews(30);
  }
};