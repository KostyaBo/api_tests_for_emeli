export interface RequestParams {
    page?: number;
    per_page?: number;
}

export interface Post {
    id: number;
    date: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
}

export interface Pages {
    id: number;
    date: string;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    guid: {
        rendered: string;
    };
}