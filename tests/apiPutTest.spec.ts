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
    categories: number[]; 
    tags: number[]; 
    class_list: string[]; 
  }

  test.describe ('WordPress API Put with Validation', () => {
    const baseUrl = 'https://dev.emeli.in.ua/wp-json/wp/v2';
    const credentials = Buffer.from('admin:Engineer_123').toString('base64');
    const PERFORMANCE_TIMEOUT = 3000;

test('Edit Title Content Status in prev created post', async ({request})=> {
    const postID = 14742;
    const updateData = {
        title: 'New Update Title',
        content: 'New Update Content',
        status: 'publish'
    }
const response = await request.put(`${baseUrl}/posts/${postID}`, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    data: updateData
  });
  expect(response.status()).toBe(200)

  const responseData = await response.json() as WordPressPost;

  expect(responseData).toEqual(
    expect.objectContaining({
      id: postID, 
      title: expect.objectContaining({
        raw: updateData.title,
        rendered: expect.stringContaining(updateData.title)
      }),
      content: expect.objectContaining({
        raw: updateData.content,
        rendered: expect.stringContaining(updateData.content),
        protected: false
      }),
      status: updateData.status,
      categories: expect.arrayContaining([1]),
      tags: expect.arrayContaining([]),
      class_list: expect.arrayContaining(['post-14742', 'post'])
    })
  )

  console.log(`Post ${postID} updated successfully`)

})
})