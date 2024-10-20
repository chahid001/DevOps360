declare namespace NodeJS {
    export interface ProcessEnv {
        USER_VM: string;
        PUBLIC_KEY: string;
        SONAR_DB_USER: string;
        SONAR_DB_PASSWORD: string;
        GITLAB_DB_USER: string;
        GITLAB_DB_PASSWORD: string;
    }
}