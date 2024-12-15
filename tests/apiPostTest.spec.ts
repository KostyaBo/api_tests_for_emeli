import { test, expect } from '@playwright/test';

interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  comment_status: string;
  ping_status: string;
  template: string;
  meta: object;
}

let createdPostIds: number[] = [];

test.describe('WordPress API Post Creation with Validation', () => {
  const baseUrl = 'https://dev.emeli.in.ua/wp-json/wp/v2';
  const credentials = Buffer.from('admin:Engineer_123').toString('base64');
  const PERFORMANCE_TIMEOUT = 3000;

  // Инициализация тестового окружения
  test.beforeAll(async ({ request }) => {
    try {
      // Проверка доступности API
      const healthCheck = await request.get(`${baseUrl}/posts`, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });
      
      expect(healthCheck.status()).toBe(200, 'API should be accessible');

      // Проверка возможности создания поста (пробное создание)
      const testPostResponse = await request.post(`${baseUrl}/posts`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        data: {
          title: 'Test Permissions Post',
          content: 'Testing user permissions',
          status: 'draft'
        }
      });

      expect(testPostResponse.status()).toBe(201, 'User should have permission to create posts');
      
      // Сохраняем ID тестового поста для последующего удаления
      const testPost = await testPostResponse.json();
      createdPostIds.push(testPost.id);
      
      console.log('Test environment initialized successfully');
    } catch (error) {
      console.error('Failed to initialize test environment:', error);
      throw error;
    }
  });

  // Очистка после всех тестов
  test.afterAll(async ({ request }) => {
    console.log('Cleaning up test posts...');
    
    // Удаление всех созданных во время теста постов
    for (const postId of createdPostIds) {
      try {
        const deleteResponse = await request.delete(`${baseUrl}/posts/${postId}`, {
          headers: {
            'Authorization': `Basic ${credentials}`
          }
        });
        
        if (deleteResponse.status() === 200) {
          console.log(`Successfully deleted post ${postId}`);
        }
      } catch (error) {
        console.error(`Failed to delete post ${postId}:`, error);
      }
    }
    
    createdPostIds = [];
  });

  test('should create a post with performance and response validation', async ({ request }) => {
    const postData = {
      title: 'Performance Test Post',
      content: 'Content for performance testing',
      status: 'publish',
      ping_status: 'closed'
    };

    const startTime = Date.now();

    const response = await request.post(`${baseUrl}/posts`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      data: postData
    });

    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(PERFORMANCE_TIMEOUT);

    expect(response.status()).toBe(201);

    const responseData = await response.json() as WordPressPost;
    
    // Сохраняем ID созданного поста для последующей очистки
    createdPostIds.push(responseData.id);

    // Проверка структуры и типов данных
    expect(responseData).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        date: expect.any(String),
        date_gmt: expect.any(String),
        guid: expect.objectContaining({
          rendered: expect.any(String)
        }),
        modified: expect.any(String),
        modified_gmt: expect.any(String),
        slug: expect.any(String),
        status: expect.any(String),
        type: expect.any(String),
        link: expect.any(String),
        title: expect.objectContaining({
          rendered: expect.any(String)
        }),
        content: expect.objectContaining({
          rendered: expect.any(String),
          protected: expect.any(Boolean)
        }),
        author: expect.any(Number),
        comment_status: expect.any(String),
        ping_status: expect.any(String),
        template: expect.any(String),
        meta: expect.any(Object)
      })
    );

    expect(responseData.title.rendered).toBe(postData.title);
    expect(responseData.content.rendered).toContain(postData.content);
    expect(responseData.status).toBe(postData.status);

    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
    expect(responseData.date).toMatch(dateRegex);
    expect(responseData.modified).toMatch(dateRegex);

    const urlRegex = /^https?:\/\/.+/i;
    expect(responseData.link).toMatch(urlRegex);
    expect(responseData.guid.rendered).toMatch(urlRegex);

    expect(['open', 'closed']).toContain(responseData.comment_status);
    expect(['open', 'closed']).toContain(responseData.ping_status);
    expect(responseData.ping_status).toBe('closed');
    expect(responseData.type).toBe('post');

    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');
  });

  test('should handle performance degradation', async ({ request }) => {
    const iterations = 3;
    const responseTimes: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      const response = await request.post(`${baseUrl}/posts`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        data: {
          title: `Performance Test ${i + 1}`,
          content: 'Content for performance testing',
          status: 'publish'
        }
      });

      const responseData = await response.json();
      createdPostIds.push(responseData.id);
      
      responseTimes.push(Date.now() - startTime);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const averageTime = responseTimes.reduce((a, b) => a + b) / iterations;
    const maxDeviation = Math.max(...responseTimes) - Math.min(...responseTimes);
    
    expect(maxDeviation).toBeLessThan(PERFORMANCE_TIMEOUT / 2);
    expect(averageTime).toBeLessThan(PERFORMANCE_TIMEOUT);
  });
});