from Scweet.scweet import Scweet
from Scweet.utils import create_mailtm_email

email, password = create_mailtm_email()

scweet = Scweet(proxy=None, cookies=None, cookies_path='cookies',
                user_agent=None, disable_images=True, env_path='.env',
                n_splits=-1, concurrency=5, headless=False, scroll_ratio=100)

# Scrape tweets
results = scweet.scrape(
  since="2024-10-01",
  until="2025-03-15",
  words=["A6v1DvkYGuvfyJR4hmzcgptFE72MhU3ijbhECdXWvZq7"],
  lang="en",
  limit=20,
  minlikes=10,
  minretweets=10,
  save_dir='outputs',
  custom_csv_name='crypto.csv'
)
print(len(results))