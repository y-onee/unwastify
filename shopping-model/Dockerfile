FROM public.ecr.aws/lambda/python:3.11
RUN pip install xgboost pandas scikit-learn --prefer-binary
COPY model.json .
COPY handler.py .
CMD ["handler.handler"]