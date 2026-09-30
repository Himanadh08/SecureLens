pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "himanadh08/securelens-backend:latest"
        FRONTEND_IMAGE = "himanadh08/securelens-frontend:latest"
    }

    stages {
        // Stage 1: Pull the freshly built images from Docker Hub
        stage('Pull Latest Images') {
            steps {
                bat "docker pull ${BACKEND_IMAGE}"
                bat "docker pull ${FRONTEND_IMAGE}"
                echo "Got latest images from Docker Hub"
            }
        }

        // Stage 2: Stop any currently running old versions of the app
        stage('Stop Old Containers') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
                    bat "docker compose down"
                }
                echo "Old containers stopped"
            }
        }

        // Stage 3: Start the newly pulled versions of the app
        stage('Start New Containers') {
            steps {
                bat "docker compose up -d"
                echo "New containers starting..."
            }
        }

        // Stage 4: Verify the application started successfully
        stage('Health Check') {
            steps {
                sleep time: 15, unit: 'SECONDS'
                bat "curl -f http://localhost:8000/docs"
                bat "curl -f http://localhost:3001"
                echo "Both services are healthy and running"
            }
        }
    }

    post {
        success {
            echo "DEPLOYED SUCCESSFULLY"
            echo "Frontend: http://localhost:3001"
            echo "Backend:  http://localhost:8000"
        }
        failure {
            echo "DEPLOYMENT FAILED"
            echo "Check logs with: docker compose logs"
        }
    }
}
