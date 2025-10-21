FROM nginx:alpine

# Copia a configuração customizada
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 5003
CMD ["nginx", "-g", "daemon off;"]
