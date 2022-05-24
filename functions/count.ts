export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  console.log(url);
  //const id = url.searchParams.get('id');
  console.log(env);
  const downloadCounter = env.DOWNLOAD_COUNTER.get(123);

  const value = await downloadCounter.fetch('https://images.pages.dev/increment');

  return new Response(`test: ${value}`, {
    status: 200,
  });
};
