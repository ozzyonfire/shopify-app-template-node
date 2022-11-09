FROM node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
ENV NEXT_PUBLIC_SHOPIFY_API_KEY=$SHOPIFY_API_KEY
EXPOSE 8081
WORKDIR /app
COPY web .
RUN yarn install
RUN cd frontend && yarn install && yarn run build
CMD ["npm", "run", "serve"]
