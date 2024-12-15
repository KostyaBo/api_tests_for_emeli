import { APIRequestContext, APIResponse } from '@playwright/test';
import { CONFIG } from '../config';
import { RequestParams, Posts, Pages} from '../types/api.types';

export class ApiElements {
    private readonly request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

   
    async fillingRequest(params?: RequestParams): Promise<APIResponse> {
        return await this.request.get(CONFIG.apiPathPosts, {
            params,
        });
    }

    async fillingRequestForPages(params?: RequestParams): Promise<APIResponse> {
        return await this.request.get(CONFIG.apiPathPages, {
            params,
        });
    }

   
    async getPosts(params?: RequestParams): Promise<Posts[]> {
        const response = await this.fillingRequest(params);
        
        if (!response.ok()) {
            throw new Error(`API request failed with status ${response.status()}`);
        }

        return response.json();
    }

    async getPages(params?: RequestParams): Promise<Pages[]> {
        const response = await this.fillingRequest(params);

        if (!response.ok()) {
            throw new Error(`API request failed with status ${response.status()}`);
        }
    }

   
    static validatePostStructure(post: Posts): boolean {
        return (
            typeof post.id === 'number' &&
            typeof post.date === 'string' &&
            typeof post.title?.rendered === 'string' &&
            typeof post.content?.rendered === 'string' &&
            new Date(post.date).toString() !== 'Invalid Date'
        );
    }

    static validatePagesStructure(page: Pages): boolean {
        return (
            typeof page.id === 'number' &&
            typeof page.date === 'string' &&
            typeof page.title?.rendered === 'string' &&
            typeof page.content?.rendered === 'string' &&
            typeof page.guid?.rendered === 'string'
        );
    }

   
    static async checkResponseStatus(response: APIResponse): Promise<number> {
        return response.status();
    }
}