#include<stdio.h>
#include<stdlib.h>


// basic
//      node
//          uint32
//          uint32array
//          node
//          nodearray

typedef struct _Node {
    struct Node* pointer;
    unsigned int type;
    void* data;
} Node;

typedef struct _NodeArray {
    unsigned int length;
    Node* data;
} NodeArray;

Node data[256];

typedef struct _Uint32Array {
    unsigned int length;
    unsigned int* data;
} Uint32Array;

void NodeInit(Node* p) {
    p->pointer = 0;
    p->type = 0;
    p->data = 0;
}

void NodeFree(Node* p) {
    if(p->type == 2) {
        Uint32Array* p2 = (Uint32Array*)p->data;
        free( p2->data );
    } else if(p->type == 4) {
        NodeArray* p2 = (NodeArray*)p->data;
        free( p2->data );
    }
    if(p->data) free(p->data);
    p->pointer = 0;
    p->type = 0;
}

unsigned int NodeNewUint32(Node* p,unsigned int i) {
    p->type = 1;
    p->data = malloc(sizeof(unsigned int));
    *((int*)p->data) = i;
    return i;
}

Uint32Array* NodeNewUint32Array(Node* p, unsigned int sz) {
    Uint32Array* p2 = 0;
    p->type = 2;
    p->data = malloc(sizeof(Uint32Array));
    p2 = (Uint32Array*)p->data;
    p2->length = sz;
    p2->data = malloc(sizeof(unsigned int)*sz);
    return p2;
}

Node* NodeNewNode(Node* p) {
    p->type = 3;
    p->data = malloc(sizeof(Node));
    return (Node*)p->data;
}

NodeArray* NodeNewNodeArray(Node* p, unsigned int sz) {
    NodeArray* p2 = 0;
    p->type = 4;
    p->data = malloc(sizeof(NodeArray));
    p2 = (NodeArray*)p->data;
    p2->length = sz;
    p2->data = malloc(sizeof(Node)*sz);
    return p2;
}

Uint32Array* NodeGetUint32Array(Node* p) {
    if(p->type == 2) {
        return (Uint32Array*)p->data;
    }
    return 0;
}

void NodePrint(Node* p) {
    if(p->type == 1) {
        printf("%d",*((int*)p->data));
    }
}
unsigned int Uint32ArraySet(Uint32Array* p, int index, unsigned int value) {
    p->data[index % p->length] = value;
    return value;
}
unsigned int Uint32ArrayGet(Uint32Array* p, int index) {
    return p->data[index % p->length];
}

#define _s Uint32ArraySet
#define _r Uint32ArrayGet

int main() {
    int x = 0;
    Uint32Array* arr;
    /*
        MACRO HERE
    */
    arr = NodeNewUint32Array(&data[0],10);
    for(x = 0; x < 10;x++) {
        Uint32ArraySet(arr,x,(unsigned int)x*2);
        printf("%d,",Uint32ArrayGet(arr,x));
    }
    //NodePrint(&data[0]);
    /*
        available
        var i = 0;
        var i = [1,2,3,4];
        var i = [[1,2,3,4],[1,2,3,4]];
        var i = [[[1,2,3,4]],[[1,2,3,4]]];

        just for math mapped

        workflow:

            function copy(i,arr) {
                "arr = NodeNewUint32Array(&data["+i+"]," + arr.length + ")";
                for(var x = 0; x < arr.length;x++) {
                    "Uint32ArraySet(arr,x,"+arr[x]+");";
                }
            }
        then complete the code in c with the algorithm:
            any -> probably image filter
                stegano
                water mark
                some kind of random effect
                -> any neural

            prepare threads
            return json of what matters
    */
    printf("{ \"result\" : \">> Hello World!\" }");
}
