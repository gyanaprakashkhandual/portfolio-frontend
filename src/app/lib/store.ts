import { configureStore } from "@reduxjs/toolkit";
import musicReducer from "./features/music/music.slice";
import likesReducer from "./features/likes/like.slice";
import commentsReducer from "./features/comments/comment.slice";
import skillsReducer from "./features/skill/skill.slice";
import blogsReducer from "./features/blogs/blog.slice"
import experienceReducer from "./features/experience/experience.slice";
import educationReducer from "./features/education/education.slice";
import projectsReducer from "./features/projects/projects.slice";
import contactReducer from "./features/contact/contact.slice";

export const store = configureStore({
  reducer: {
    music: musicReducer,
    likes: likesReducer,
    comments: commentsReducer,
    skills: skillsReducer,
    blogs: blogsReducer,
    experience: experienceReducer,
    education: educationReducer,
    projects: projectsReducer,
    contact: contactReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;