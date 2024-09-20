FROM node:14
#chuẩn bị môi trường nodejs và phiên bản đang sử dụng là 14.18.0 nên ghi là 14-alpine, hậu tố alpine là một phiên bản của nodeJS, nó căt giảm những thư viện ko cần thiết của nodejs đi dẫn đến việc kéo node từ dockerhub xuống docker déktop đc dễ dàng hơn, nhưng vì máy khỏe nên chơi luôn 14 nha:))

WORKDIR /phanpiscean/medicalcarebackend
#định nghĩa thư mục lưu src cde backend trong docker
COPY package*.json ./
#sau khi docker đã có các file package.json thì sẽ chạy câu lệnh run 
RUN npm install

RUN npm install -g @babel/core @babel/cli

COPY . .
#ở câu lệnh COPY này, dấu chấm thứ nhất là tất cả các file ngang hàng với Dockerfile, còn dấu chấm thứ 2 là thư mục ta tạo ở docker, là thư mục ở dòng 4: /phanpiscean/medicalcarebackend

RUN npm run build-src
#có câu lệnh này tại vì ở file .dockerignore, ta không cho chúng copy thư mục build, nên khi này docker cần tự build lại thư mục build của mình

CMD ["npm", "run", "build"]