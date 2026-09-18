import { NewPost, Post } from "@/types";
import axios from "axios";

const credentials = btoa(
  `${import.meta.env.VITE_ADMIN_USERNAME}:${import.meta.env.VITE_ADMIN_PASSWORD}`
);

const PAGE_SIZE = 5;
const BASE_URL = "http://localhost:8080/api";

export const postService = {
    
    // All the services regarding posts
    async readPosts(page: number, pageSize: number) {
        try {            
            const response = await axios(
                `${BASE_URL}/posts`
                , { headers: {
                "Content-Type": "application/json",
                },
                params: {
                    page,
                    size: PAGE_SIZE,
                    sortBy: "createdAt",
                    descending: true,
                },
            });
            console.log(response);
            return response;
        } catch (err) {
            return undefined;
          }
    },
    
    async deletePost(id: string, page: number): Promise<Post[] | undefined> {
  
        try {  
            const response = await axios.delete(`${BASE_URL}/posts/${id}`,
                { headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/json",
                }
            });
            const posts = await this.readPosts(page, PAGE_SIZE);
      
            return posts;
        } catch (err) {
            console.log(err);
            return;
        }
    },

    async savePost(id: string, post: NewPost, page: number): Promise<Post[] | undefined> {
        try {  
        const response = await axios.put(`${BASE_URL}/posts/${id}`,
            post,
            { headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/json",
            }
            });
            const resp = await this.readPosts(page, PAGE_SIZE);
            if (resp !== undefined) return resp;
            return undefined;
        }
            catch (err) {
            console.log(err);
        }
    },
    
    async postNew(page: number, newPost: NewPost): Promise<Post[] | undefined> {

        try {
            const response = await axios.post(`${BASE_URL}/posts`,
                 newPost  ,
            { headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Type": "application/json",
                }
            });
            console.log(response);
            
            const resp = await this.readPosts(page, PAGE_SIZE);
            if (resp !== undefined) return resp;
            return undefined;
            
        } catch (err) {
            return undefined;
        }
    }
}