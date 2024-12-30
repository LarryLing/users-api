export type User = {
    id : number;
    first_name : string;
    last_name : string;
    email : string;
    phone_number : string;
    hometown : string;

}

export type UserProfile = {
    id : number;
    user_id : number;
    profile_picture : string;
    background_picture : string;
    major : string;
    graduation_year : number;
    bio : string;
    date_of_birth : string;
    pronouns : string;
    created_at : string;
}