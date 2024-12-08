import { expect, test, APIRequestContext } from '@playwright/test';
import { ApiElements } from '../pages/apiElements';
import { CONFIG } from '../config';

test.describe('WordPress API Tests', () => {
    let apiRequestContext: APIRequestContext;
    let apiElements: ApiElements;

    test.beforeEach(async ({ playwright }) => {
        apiRequestContext = await playwright.request.newContext({
            baseURL: CONFIG.baseUrl,
            extraHTTPHeaders: CONFIG.defaultHeaders,
        });
        apiElements = new ApiElements(apiRequestContext);
    });

    test.afterEach(async () => {
        await apiRequestContext.dispose();
    });

    test('should verify posts pagination and data structure', async () => {
        const params = {
            page: 1,
            per_page: 5
        };

        const posts = await apiElements.getPosts(params);
        
        expect(Array.isArray(posts)).toBeTruthy();
        expect(posts.length).toBeLessThanOrEqual(params.per_page);
        
        for (const post of posts) {
            expect(ApiElements.validatePostStructure(post)).toBeTruthy();
        }
    });

    test('should verify pages pagination and data structure', async () => {
        const params = {
            page: 1,
            per_page: 5
        };

        const pages = await apiElements.getPosts(params);
        
        expect(Array.isArray(pages)).toBeTruthy();
        expect(pages.length).toBeLessThanOrEqual(params.per_page);
        
        for (const page of pages) {
            expect(ApiElements.validatePagesStructure(page)).toBeTruthy();
        }
    });

    test('should return 400 status for invalid pagination parameters', async () => {
        const invalidParams = {
            page: -1,
            per_page: 1000
        };

        const response = await apiElements.fillingRequest(invalidParams);
        const status = await ApiElements.checkResponseStatus(response);
        
        
        expect(status).toBe(400);
        
       
        const errorResponse = await response.json();
        expect(errorResponse).toHaveProperty('code');
        expect(errorResponse).toHaveProperty('message');
    });

    test('should handle edge case pagination parameters', async () => {
        
        const edgeParams = {
            page: 1,
            per_page: 100 
        };

        const response = await apiElements.fillingRequest(edgeParams);
        expect(response.ok()).toBeTruthy();
        
        const posts = await response.json();
        expect(Array.isArray(posts)).toBeTruthy();
        expect(posts.length).toBeLessThanOrEqual(100);
    });
});
