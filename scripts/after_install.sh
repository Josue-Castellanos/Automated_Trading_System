#!/usr/bin/bash

echo "Pull Finished"
git pull origin main
sudo systemctl daemon-reload
sudo systemctl restart nginx
sudo systemctl restart gunicorn
sudo service gunicorn restart
echo "Done!"
