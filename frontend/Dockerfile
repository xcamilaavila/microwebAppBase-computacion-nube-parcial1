FROM python:3.9
WORKDIR /app
COPY . /app
RUN pip install Flask==2.3.3 flask-cors requests
EXPOSE 5001
CMD ["python", "run.py"]
