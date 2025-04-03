/**
 * Parameters for retrieving details about a specific Communication (House or Senate).
 * Define based on API endpoint structure, e.g., /communication/{chamber}/{congress}/{number}
 */
export interface CommunicationResourceParams {
    chamber: 'house' | 'senate';
    congress: string;
    number: string;
}

export interface CommunicationDetail {
    // Define fields based on API response
    [key: string]: any; // Placeholder
}
