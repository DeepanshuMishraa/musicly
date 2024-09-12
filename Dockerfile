FROM node:20

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

RUN npx prisma migrate dev
RUN npx prisma generate

EXPOSE  3000

CMD ["npm run dev"]
