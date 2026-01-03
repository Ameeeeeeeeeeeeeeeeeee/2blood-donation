@echo off
echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo Running migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo Setup complete! To start the server, run:
echo   venv\Scripts\activate
echo   python manage.py runserver
echo.
echo Don't forget to create a superuser:
echo   python manage.py createsuperuser

