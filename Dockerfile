FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html
COPY dist /usr/share/nginx/html/

RUN echo $(ls -1 /usr/share/nginx/html/)      

RUN echo "mainFileName=\"\$(ls /usr/share/nginx/html/main*.js)\" && \
          envsubst '\$API_URL,\$APP_VERSION,\$RECAPTCHA_SITE_KEY ' < \${mainFileName} > main.tmp && \
          mv main.tmp  \${mainFileName} && \ 
          nginx -g 'daemon off;'" > run.sh   

#RUN echo "nginx -g 'daemon off;'" > run.sh
ENTRYPOINT ["sh", "run.sh"]