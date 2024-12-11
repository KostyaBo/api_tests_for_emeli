import { expect, test, APIRequestContext } from '@playwright/test';
import { ApiElements } from '../pages/apiElements';

test.describe('Create Articles ', () => {
    let apiContex;
    test.beforeAll(async ({ playwright }) =>  {
    apiContex = await playwright.request.newContext({   
            baseURL:'https://dev.emeli.in.ua/wp-json/wp/v2',
            extraHTTPHeaders: {
                Authorization: 'Basic'+Buffer.from('admin:Engineer_123').toString('base64'),
                'Content-Type':'application/json',
            },
        });

})

    test('Create Article with Req', async ()=> {
        const newPost = {
            title: 'Final',
            content: 'Champion',
            status: 'publish',
        }
        const response = await apiContex.post('/posts', {data:newPost,})
        // expect(response.ok()).toBeTruthy();
        const responseBody = await response.json();
        expect(responseBody.id).toBeDefined();
        expect(responseBody.title).toBeDefined();
        const postId = responseBody.id;
        console.log('Article is created: ${postId}')
    })
});