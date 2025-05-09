FROM python:3.13-alpine

ENV APP_HOME=/app
RUN mkdir $APP_HOME
RUN mkdir $APP_HOME/staticfiles
WORKDIR $APP_HOME

LABEL maintainer='trading@josuecastellanos.com'
LABEL portfolio="https://www.josuecastellanos.com/"
LABEL description="Development image for my Trading Chart website"

ENV PYTHONDOTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

RUN apk update \
    && apk add --no-cache build-base libpq gettext netcat-openbsd gcc python3-dev musl-dev linux-headers postgresql-dev \
    && rm -rf /var/cache/apk/*

RUN pip install --upgrade pip

COPY requirements.txt /app/requirements.txt

RUN pip install -r requirements.txt

COPY ./docker/local/django/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

COPY ./docker/local/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

ENTRYPOINT [ "/entrypoint"]
