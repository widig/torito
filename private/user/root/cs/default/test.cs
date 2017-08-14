using System;
using System.Numerics;
namespace HelloSpace
{
    public class OP8 { // small images, raster operator
        ulong[] data;
        byte it;
        public OP8() { 
            this.data = new ulong[4];
            this.data[0] = 0;
            this.data[1] = 0;
            this.data[2] = 0;
            this.data[3] = 0;
            this.it = 0;
        }
        public OP8(byte[] data,byte it) {
            this.data = new ulong[4];
            this.setBytes(data);
            this.it = it;
        }
        public void setBytes( byte[] data ) {
            if(data.Length != 32) throw new Exception( "invalid size for this op." );
            for(int x = 0; x < 32;x++) {
                int m = x % 8;
                int p = ( x - m ) / 8;
                ulong c = 0xFF;
                c <<= ( 8 * m );
                c = ~c;
                this.data[p] &= c;
                c = data[x];
                this.data[p] |= ( c << ( 8 * m ) );
            }
        }
        public byte[] getBytes() {
            byte[] ret = new byte[32];
            int c = 0;
            for(int x = 0; x < 4;x++) {
                for(int y = 0; y < 8;y++) {
                    ulong i = 0xFF;
                    ret[c++] = (byte) ( ( this.data[x] & ( i << ( 8 * y ) ) ) >> ( 8 * y ) );
                }
            }
            return ret;
        }
        private float saturation() { // best saturation is 0, worst saturation(1) leads to shortcut
            byte[] t = this.getBytes();
            float r = 0;
            for(int x = 0; x < 256;x++) {
                int m = x % 8;
                int p = ( x - m ) / 8;
                if( ( t[p] & ( 1 << m ) ) > 0) {
                    r += 1;
                }
            }
            return r/256.0f;
        }
        private void next_it() {
            int i = this.it;
            i = (i + 1)%256;
            this.it = (byte)i;
        }
        public void include(byte min, byte max) {
            byte b1 = min < max ? min : max;
            byte b2 = min < max ? max : min;
            int m1 = b1 % 64;
            int p1 = (b1 -m1 ) / 64;
            int m2 = b2 % 64;
            int p2 = (b2 -m2) / 64;
            for(int x = 0; x < 4;x++) {
                if( x >= p1 && x <= p2) {
                    if(x == p1) {
                        if(p2>p1) for(int y = m1; y < 64;y++) this.data[x] |= (ulong)( (ulong)1 << y );
                        else for(int y = m1; y < m2;y++) this.data[x] |= (ulong)( (ulong)1 << y );
                    } else if(x == p2) {
                        for(int y = 0; y < m2;y++) this.data[x] |= (ulong)( (ulong)1 << y);
                    } else {
                        for(int y = 0; y < 64;y++) this.data[x] |= (ulong)( (ulong)1 << y);
                    }
                }
            }
        }
        public void exclude(byte min, byte max) {
            byte b1 = min < max ? min : max;
            byte b2 = min < max ? max : min;
            int m1 = b1 % 64;
            int p1 = (b1 -m1 ) / 64;
            int m2 = b2 % 64;
            int p2 = (b2 -m2) / 64;
            for(int x = 0; x < 4;x++) {
                if( x >= p1 && x <= p2) {
                    if(x == p1) {
                        if(p2>p1) for(int y = m1; y < 64;y++) this.data[x] &= (ulong) ~( (ulong)1 << y );
                        else for(int y = m1; y < m2;y++) this.data[x] &= (ulong)~( (ulong)1 << y );
                    } else if(x == p2) {
                        for(int y = 0; y < m2;y++) this.data[x] &= (ulong)~( (ulong)1 << y);
                    } else {
                        for(int y = 0; y < 64;y++) this.data[x] &= (ulong)~( (ulong)1 << y);
                    }
                }
            }
        }
        public OP8 Mutate() {
            int at = this.it;
            next_it();
            byte[] t = this.getBytes();
            int m = at % 8;
            int p = ( at - m ) / 8;
            if( ( t[p] & ( 1 << m ) ) > 0) {
                // switch to 0
                byte b = 1;
                t[p] &= (byte) ( ~( b << m ) );
            } else {
                // switch to 1
                byte b = 1;
                t[p] |= (byte)( b << m );
            }
            return new OP8(t,this.it);
        }
        
        public string bin() {
            byte[] t = this.getBytes();
            string ret = "";
            for(int x = 0; x < 256;x++) {
                int m = x % 8;
                int p = ( x - m ) / 8;
                if( ( t[p] & ( 1 << m ) ) > 0) {
                    ret += "1";
                } else {
                    ret += "0";
                }
            }
            return ret;
        }
        public bool eval( byte data ) {
            int m = data % 64;
            int p = ( data - m ) / 64;
            ulong i = 1;
            bool r = ( this.data[p] & ( i << m )  ) > 0;
            return r;
        }
    }
    public class OP8V { // small concepts, vector operator
        // 256 double ranges
    }
    public class Hello 
    {
        public static int TestOP8_gt(OP8 o1, byte b) { // find operator greater equal than b
            int count = 0;
            for(int x = 0; x < 256;x++) if( (b < x) == o1.eval((byte)x)  ) count += 1;
            return count;
        }
        public static int TestOP8_lt(OP8 o1, byte b) { // find operator greater equal than b
            int count = 0;
            for(int x = 0; x < 256;x++) if( (b > x) == o1.eval((byte)x)  ) count += 1;
            return count;
        }
        public static int TestOP8_eq(OP8 o1, byte b) {
            int count = 0;
            for(int x = 0; x < 256;x++) if( (b==x) == o1.eval((byte)x) ) count += 1;
            return count;
        }
        public static int TestOP8_includeRange(OP8 o1, byte min, byte max) {
            int count = 0;
            for(int x = 0; x < 256;x++) {
                bool b = (x >= min && x <= max);
                if( b && o1.eval((byte)x) ) count += 1;
            }
            return count;
        }
        public static int TestOP8_excludeRange(OP8 o1, byte min, byte max) {
            int count = 0;
            for(int x = 0; x < 256;x++) {
                bool b = (x >= min && x <= max);
                if( b && !o1.eval((byte)x) ) count += 1;
            }
            return count;
        }
        /*
            learn:
                M is used for K

                LIVE K:
                    get what is used for K
                    A = test if range belong to X 
                    if A include in M
                    else do nothing
                    if M is good do nothing.
                    else create N, N is used for K
            
        */

        public static void TestOP8() {
            OP8 o1 = new OP8();
            int amount = 0;
            int amountMax = 512;
            while(true) {
                int count1 = TestOP8_gt(o1,10);
                OP8 o2 = o1.Mutate();
                int count2 = TestOP8_gt(o2,10);
                if(count2 > count1) {
                    o1 = o2;
                    Console.WriteLine("changed {0}",count2);
                }
                amount += 1;
                if(amount > amountMax) break;
            }
            Console.WriteLine("{0}",o1.bin());
        }
        public static byte Make(OP8[] op8, byte dataIn) {
            byte dataOut = 0;
            for(int x = 0; x< 8;x++) {
                dataOut |= (op8[x].eval(dataIn) ? (byte)( 1 << x ) : (byte)0);
            }
            return dataOut;
        }
        public static void Test2OP8() { // training 8*OP8, get byte->byte dict 
            OP8[] op8 = new OP8[8];
            for(int x = 0; x < 8;x++) op8[x] = new OP8();
            int k = 0;
            byte m = 0;
            while(true) {
                int z = (m + 1)%256; // expected

                byte b1 = Make(op8,m);

                if(b1 == z) {
                    Console.WriteLine("reached {0}",m);
                    if(m == 255) break;
                    m += 1;
                    continue;
                }
                // change op
                OP8 o3 = op8[k%8];
                OP8 o2 = op8[k%8].Mutate();
                op8[k%8] = o2;
                byte b2 = Make(op8,m);

                if( Math.Abs((double)b2-(double)z) > Math.Abs((double)b1-(double)z) ) {
                    // back track
                    op8[k%8] = o3;
                }
                k += 1;
                k = k % 8;
            }

            Console.WriteLine("OK2");

        }
        public static void Main() {
            Console.WriteLine("OK1");
            Test2OP8();

            //TestOP8();
        }
    }
}
