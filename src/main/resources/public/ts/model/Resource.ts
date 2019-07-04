export interface Resource {
    _id: string;
    title: string;
    authors: string[];
    editors: string[];
    image: string;
    disciplines: string[];
    levels: string[];
    document_types: string[];
    link: string;
    date: number; //timestamp
    plain_text: string;
}