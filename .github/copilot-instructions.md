# Nutripatrol Frontend

The Nutripatrol frontend is a React + TypeScript + Vite application using Material-UI for the Open Food Facts moderation tool. It is deployed at https://nutripatrol.openfoodfacts.org/ and works with the backend [Nutripatrol API](https://github.com/openfoodfacts/nutripatrol).

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Build the Application
1. **Install dependencies**:
   ```bash
   yarn install
   ```
   - Takes ~0.3 seconds
   - Uses Yarn v1.22.22 package manager

2. **Start development server**:
   ```bash
   yarn dev
   ```
   - Starts in ~170ms on http://localhost:5173/
   - **WARNING: Contains infinite React loop bug** - app loads but console shows "Maximum update depth exceeded"
   - **NEVER CANCEL** - This is expected behavior, the app still functions for testing

3. **Build for different environments**:
   ```bash
   # Staging build (bypasses TypeScript checks)
   yarn build-staging
   
   # Production build (bypasses TypeScript checks)  
   yarn build-prod
   ```
   - Both take ~4.5 seconds. NEVER CANCEL. Set timeout to 10+ minutes.
   - These commands work and are used by CI/CD

4. **DO NOT use regular build command**:
   ```bash
   yarn build  # FAILS - Do not use
   ```
   - Fails in ~3.5 seconds due to TypeScript errors (unused variables in AppBar.tsx)
   - Use `yarn build-staging` or `yarn build-prod` instead

### Linting
5. **DO NOT use lint command**:
   ```bash
   yarn lint  # FAILS - Do not use  
   ```
   - Fails immediately due to missing eslint.config.js (ESLint v9 incompatibility)
   - Project needs ESLint migration from legacy .eslintrc format

## Known Issues and Workarounds

### Critical Issues
- **React Infinite Loop**: App.tsx has circular useEffect/useCallback dependency causing console warnings. App still functions.
- **TypeScript Build Failure**: Unused variables in src/components/AppBar.tsx prevent `yarn build` from working
- **ESLint Configuration Missing**: Lint command fails due to ESLint v9 configuration incompatibility
- **Backend Dependency**: App expects Nutripatrol API backend at localhost:8000/api/v1 for full functionality

### Environment Setup
- **Development Mode**: Set `VITE_DEVELOPPEMENT_MODE = "development"` in .env.local to bypass authentication
- **API URLs**: Configured via environment variables (.env.local, .env.preprod, .env.prod)
- **External Dependencies**: Connects to https://world.openfoodfacts.org for authentication and https://image.openfoodfacts.org for images

## Manual Validation Scenarios

### Always test these scenarios after making changes:

1. **Basic Application Loading**:
   - Run `yarn dev` 
   - Navigate to http://localhost:5173/
   - Verify home page loads with Nutripatrol branding
   - **Expected**: Console shows React warnings but page renders correctly

2. **Navigation Testing**:
   - Click "Images" in navigation (moderator route)
   - Click "Product" in navigation (moderator route)  
   - Test both desktop and mobile responsive layouts
   - **Expected**: Routes work, responsive design functions

3. **Authentication Flow**:
   - In development mode: Should show green "logged in" avatar
   - Test logout functionality if authentication is working
   - **Expected**: Development mode bypasses auth, shows moderator interface

4. **Form Routes Testing**:
   - Visit `/flag/image?barcode=123&source=web&flavor=off&image_id=456`
   - Visit `/flag/product?barcode=123&source=web&flavor=off`
   - **Expected**: Flag forms load with URL parameters populated

### Manual Testing Limitations
- **Backend Required**: Full moderation workflows need Nutripatrol API backend running
- **Authentication**: Real authentication testing requires OpenFoodFacts credentials
- **API Calls**: Many features will show connection errors without backend

## Common Project Structure

### Key Files and Directories
- `src/App.tsx` - Main application component (contains infinite loop bug)
- `src/components/AppBar.tsx` - Navigation component (has unused variables causing build failures)  
- `src/pages/` - Page components (Tutorial, ImageModeration, ModerationPage, etc.)
- `src/contexts/login.tsx` - Authentication context
- `package.json` - Project dependencies and scripts
- `.env.local`, `.env.preprod`, `.env.prod` - Environment configurations
- `vite.config.ts` - Vite build configuration

### Important URLs and Routes
- Home: `/`
- Tutorial: `/tutorial`
- Image Moderation: `/image-moderation` (moderator only)
- Product Moderation: `/moderation` (moderator only)
- Flag Forms: `/flag/image/`, `/flag/product/`

## CI/CD Pipeline
- **Deployment**: Triggered on push to main branch or tags
- **Build Commands**: Uses `yarn build-staging` for preprod, `yarn build-prod` for production
- **Deployment Target**: Static files deployed to nginx servers
- **Environment Matrix**: nutripatrol-net (staging) and nutripatrol-org (production)

## Development Best Practices

### Before Making Changes
- Always run `yarn dev` to verify current state
- Test responsive design on mobile and desktop breakpoints  
- Use development mode for testing without backend dependencies

### After Making Changes
- Run `yarn build-staging` to verify build still works (~4.5s)
- Test manual scenarios listed above
- **DO NOT** run `yarn build` or `yarn lint` - both will fail due to known issues
- Verify no new console errors beyond the expected React infinite loop warnings

### Common Development Tasks
- **Adding new pages**: Create in `src/pages/` and add to `src/App.tsx` routes
- **Modifying authentication**: Update `src/contexts/login.tsx` and `src/App.tsx`
- **Changing API endpoints**: Update environment files (.env.*)
- **UI changes**: Material-UI components used throughout, responsive design required