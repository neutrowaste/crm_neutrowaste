DO $$
BEGIN
  -- Users stuck in 'pending' status due to previous race conditions in create-user function
  -- will be forced to 'active' here so they can login and not be redirected continuously.
  UPDATE public.profiles
  SET status = 'active'
  WHERE status = 'pending';
END $$;
