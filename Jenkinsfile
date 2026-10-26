pipeline {
    agent any

    tools {
        maven 'maven-3.9.6'
    }

    environment {
        // Nom de l'image et version (le numéro de build rend chaque image unique)
        IMAGE_BACKEND  = 'campusflowdeops'
        IMAGE_FRONTEND = 'campusflowdeops-frontend'
        IMAGE_TAG      = "1.${BUILD_NUMBER}"
        // Ton identifiant Docker Hub (à adapter)
        DOCKERHUB_USER = 'ton-utilisateur-dockerhub'
    }

    triggers {
        githubPush()
        pollSCM('H/5 * * * *')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    sh 'mvn -B clean package -DskipTests'
                }
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    sh 'mvn -B test'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: 'backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                // Le Dockerfile du backend copie le JAR produit par l'étape Build
                sh "docker build -t ${IMAGE_BACKEND}:${IMAGE_TAG} -t ${IMAGE_BACKEND}:latest backend"
                // Le Dockerfile du frontend compile lui-même l'application (multi-étapes)
                sh "docker build -t ${IMAGE_FRONTEND}:${IMAGE_TAG} -t ${IMAGE_FRONTEND}:latest frontend"
            }
        }

        stage('Push Docker Image') {
            steps {
                // 'dockerhub-credentials' = identifiant créé dans Jenkins
                // (Manage Jenkins > Credentials, type "Username with password")
                withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'REG_USER',
                        passwordVariable: 'REG_PASS')]) {
                    sh '''
                        echo "$REG_PASS" | docker login -u "$REG_USER" --password-stdin

                        docker tag ${IMAGE_BACKEND}:${IMAGE_TAG}  $REG_USER/${IMAGE_BACKEND}:${IMAGE_TAG}
                        docker tag ${IMAGE_BACKEND}:latest        $REG_USER/${IMAGE_BACKEND}:latest
                        docker tag ${IMAGE_FRONTEND}:${IMAGE_TAG} $REG_USER/${IMAGE_FRONTEND}:${IMAGE_TAG}
                        docker tag ${IMAGE_FRONTEND}:latest       $REG_USER/${IMAGE_FRONTEND}:latest

                        docker push $REG_USER/${IMAGE_BACKEND}:${IMAGE_TAG}
                        docker push $REG_USER/${IMAGE_BACKEND}:latest
                        docker push $REG_USER/${IMAGE_FRONTEND}:${IMAGE_TAG}
                        docker push $REG_USER/${IMAGE_FRONTEND}:latest

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy') {
            // Optionnel : relance toute l'application avec Docker Compose
            steps {
                sh 'docker compose up -d --build'
                sh 'docker compose ps'
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'backend/target/*.jar',
                             fingerprint: true
        }
        failure {
            echo 'Pipeline en échec : consulte les logs du stage concerné.'
        }
        always {
            // Nettoie les images intermédiaires pour ne pas saturer le disque
            sh 'docker image prune -f'
        }
    }
}
