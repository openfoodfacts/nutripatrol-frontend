/**
 * 
 * REASONS : 
 * 
 * value is for the backend
 * label is for the frontend
 * 
 * Reasons depends on the type of flag
 * 
 */
export const reasons = {
    product: [
        { value: 'wrong_barcode', label: 'Wrong Barcode' },
        { value: 'missing_data', label: 'Missing Data' },
        { value: 'wrong_data', label: 'Wrong Data' },
        { value: 'other', label: 'Other' },
    ],
    image: [
        { value: 'inappropriate', label: 'Inappropriate' },
        { value: 'outdated', label: 'Outdated' },
        { value: 'includes_personal_infos', label: 'Includes Personal Information' },
        { value: 'duplicate', label: 'Duplicate' },
        { value: 'other', label: 'Other' },
    ],
    search: [
        { value: 'other', label: 'Other' },
    ]
}

/**
 * 
 * SOURCES : 
 * 
 * Sources are the origin of the flag
 * We have 2 sources : web and mobile
 * Robotoff is explicitly excluded because it is a different system
 * 
 */
export const sources = ['web', 'mobile']

/**
 * 
 * FLAVORS : 
 * 
 * Flavors give more information about the origin of the flag
 * 
 */
export const flavors = ['off', 'obf', 'opff', 'opf', 'off-pro']
