# gcloud auth configure-docker

# gcloud builds submit --tag asia.gcr.io/virtual-machines-156321/solo-gyotaku

docker build -t solo-gyotaku .
docker build -t asia.gcr.io/virtual-machines-156321/solo-gyotaku:latest .
# docker push asia.gcr.io/virtual-machines-156321/solo-gyotaku:latest

# gcloud beta run deploy solo-gyotaku \
#   --image asia.gcr.io/virtual-machines-156321/solo-gyotaku:latest \
#   --platform managed \
#   --region=asia-northeast1

# docker run --rm -p 3000:3000 asia.gcr.io/virtual-machines-156321/solo-gyotaku:latest

# docker build -t :latest .