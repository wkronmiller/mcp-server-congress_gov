// Defines parameters extracted from bill resource URIs
export interface BillResourceParams {
    congress: string;    // Congress number (e.g., "117")
    billType: string;    // Bill type (e.g., "hr", "s", "hjres")
    billNumber: string;  // Bill number (e.g., "3076")
}
