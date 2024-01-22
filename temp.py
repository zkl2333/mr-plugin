import threading
import asyncio
 
 
def thread_loop_task(loop):
 
    # 为子线程设置自己的事件循环
    asyncio.set_event_loop(loop)
 
    async def work_2():
        while True:
            print('work_2 on loop:%s' % id(loop))
            await asyncio.sleep(2)
 
    async def work_4():
        while True:
            print('work_4 on loop:%s' % id(loop))
            await asyncio.sleep(4)
 
    future = asyncio.gather(work_2(), work_4())
    loop.run_until_complete(future)
 
 
if __name__ == '__main__':
 
    # 创建一个事件循环thread_loop
    thread_loop = asyncio.new_event_loop() 
 
    # 将thread_loop作为参数传递给子线程
    t = threading.Thread(target=thread_loop_task, args=(thread_loop,))
    t.daemon = True
    t.start()
 
    main_loop = asyncio.get_event_loop()
 
 
    async def main_work():
        while True:
            print('main on loop:%s' % id(main_loop))
            await asyncio.sleep(4)
 
 
    main_loop.run_until_complete(main_work())