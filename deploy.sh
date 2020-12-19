docker build -t solo-gyotaku .
docker build -t asia.gcr.io/virtual-machines-156321/solo-gyotaku:latest .
docker push asia.gcr.io/virtual-machines-156321/solo-gyotaku:latest
gcloud beta run deploy solo-gyotaku \
  --image asia.gcr.io/virtual-machines-156321/solo-gyotaku:latest \
  --platform managed \
  --region=asia-northeast1 \
  --allow-unauthenticated \
  --cpu 2 \
  --max-instances 1 \
  --memory 1500M