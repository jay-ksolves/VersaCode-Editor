# VersaCode IDE: Project Overview

## 1. Vision

VersaCode is an open-source, web-based Integrated Development Environment (IDE) designed for the modern developer. Our vision is to create a highly extensible, AI-native coding experience that is accessible from anywhere. We aim to combine the power and flexibility of desktop IDEs like VS Code with the collaborative and cloud-native benefits of a web application.

## 2. Core Principles

- **Modularity & Extensibility:** The IDE is built with a modular architecture, allowing contributors to easily add new features, panels, and language support through a clean extension system.
- **AI-First:** Generative AI is not an afterthought; it is a core component. We leverage Genkit and Google's Gemini models to provide intelligent code suggestions, generation, and debugging assistance.
- **Developer Experience:** A clean, intuitive UI, responsive performance, and comprehensive documentation are paramount. We want contributing to VersaCode to be as enjoyable as using it.
- **Open & Collaborative:** Built entirely on open-source technologies, VersaCode is a community-driven project where every contribution is valued.

## 3. Target Audience

- **Web Developers:** Professionals looking for a powerful, customizable web-based IDE.
- **Students & Educators:** An accessible platform for learning to code without complex local environment setup.
- **Open-Source Contributors:** Developers interested in building the future of coding tools.

## 4. Getting Started

To get a local instance of VersaCode running for development:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd versacode
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`. The IDE itself is located at the `/editor` route.
