# Inventory Manager

An inventory management application built with Next.js, Firebase, and Material-UI, allowing users to add, update, and remove items from their inventory. The application is deployed using Vercel.

## Features

- Add new items to the inventory.
- Increase or decrease the quantity of existing items.
- Remove items from the inventory when their quantity reaches zero.
- View a list of all inventory items with their quantities.

## Technologies Used

- **Next.js**: A React framework for server-side rendering and static site generation.
- **Firebase**: A platform developed by Google for creating mobile and web applications, used here for Firestore (a NoSQL database).
- **Material-UI**: A popular React UI framework for designing responsive user interfaces.
- **Vercel**: A cloud platform for static sites and serverless functions that enables developers to host websites and web applications.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (>= 14.0.0)
- npm (>= 6.0.0) or yarn (>= 1.0.0)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/inventory-manager.git
    cd inventory-manager
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

    or

    ```bash
    yarn install
    ```

3. Set up Firebase:

    - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/).
    - Set up Firestore in the Firebase project.
    - Generate a Firebase configuration file and copy the configuration.

4. Create a `.env.local` file in the root of the project and add your Firebase configuration:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

5. Start the development server:

    ```bash
    npm run dev
    ```

    or

    ```bash
    yarn dev
    ```

    The application will be available at [http://localhost:3000](http://localhost:3000).

### Deployment

The application is deployed using Vercel. Follow these steps to deploy your own instance:

1. Install the Vercel CLI:

    ```bash
    npm install -g vercel
    ```

    or

    ```bash
    yarn global add vercel
    ```

2. Log in to Vercel:

    ```bash
    vercel login
    ```

3. Deploy the application:

    ```bash
    vercel
    ```

4. Follow the prompts to set up and deploy the application.

The deployed application is available at: [https://inventory-manager-chi.vercel.app/](https://inventory-manager-chi.vercel.app/)

## Application Structure

- `pages/_app.js`: Custom App component to initialize pages.
- `pages/index.js`: Main page component where the inventory management logic is implemented.
- `firebase.js`: Firebase configuration and initialization.
- `components/`: Contains reusable UI components.

## Usage

1. **Add New Item**:
    - Click on the "Add New Item" button.
    - Enter the item name in the modal that appears and click "Add".

2. **Increase Quantity**:
    - Click the "Add" button next to an item to increase its quantity by 1.

3. **Decrease Quantity**:
    - Click the "Remove" button next to an item to decrease its quantity by 1.
    - If the quantity reaches 0, the item will be removed from the inventory.

## Issues and Contributions

If you encounter any issues or have suggestions for improvements, please create an issue or submit a pull request.

## License

This project is licensed under the MIT License.

