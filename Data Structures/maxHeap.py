from __future__ import annotations
from typing import Optional

Num = int | float


class Node:
    '''
    This class is used to implement Heap in a priority queue.
    '''

    val: int | float  # priority of the node or the value used in the heap representation.
    obj: object  # node holds on to some object for the purposes of a priority queue or something similar.

    def __init__(self, val: int | float, obj: object = None):
        self.val = val
        self.obj = obj

    def __eq__(self, node: Node):
        return node.val == self.val

    def __gt__(self, other) -> bool:
        '''
        >>> a = Node(7.1)
        >>> b = Node(8)
        >>> b > a
        True
        '''
        return self.val > other.val

    def __lt__(self, other) -> bool:
        return self.val < other.val

    def change_val(self, new_val: Num):
        self.val = new_val


class MaxHeap:
    '''Can store objects of type "Node" instead of numbers if used in a priority
     queue in which case it shouldn't have other types.'''
    arrType = list[Num | Node]

    _arr: arrType = []
    _numArray: bool = False
    _nodeArray: bool = False

    def __repr__(self) -> str:
        return str(self._arr)

    # indices of other nodes
    @staticmethod
    def left(i):
        return 2 * i + 1

    @staticmethod
    def right(i):
        return 2 * (i + 1)

    @staticmethod
    def parent(i):
        return (i - 1) // 2

    @staticmethod
    def construct_MaxHeap(array: list[Num]) -> list[Num]:
        '''
        given a random list of numbers, returns the list representing a MaxHeap.
        '''
        pass #todo ooooooooooooooooooooooooooooooooooooooooooooooooooooooooo

    @staticmethod
    def HeapSort(array: list[Num]) -> list[Num]:
        # array can have Nodes only & it'll work, but I want this public interface
        '''
        returns the list sorted in ascending order.
        precondition: <<array>> represents a MaxHeap
        '''
        pass #todo ooooooooooooooooooooooooooooooooooooooooooooooooooooooooo

    def sorted(self) -> arrType:
        return MaxHeap.HeapSort(self._arr.copy())  # doesn't affect the Heap

    def max(self):
        if self._arr:
            return self._arr[0]

    def extract_max(self) -> Optional[Num | Node]:
        if self._arr:
            if len(self._arr) == 1:
                return self._arr.pop()

            root = self._arr[0]  # which will be returned
            last_node = self._arr[-1]

            self._arr.pop()  # remove the last_node
            self._arr[0] = last_node  # add it back as the new root
            self._bubbleDown(indx=0)  # and then move it to a correct place

            return root

    def insert(self, obj: Num | Node):
        error_msg = "Failed to insert: Heap can have numbers xor Nodes"
        T = type(obj)

        if (T == Node and self._numArray) or self._nodeArray and (
                T == int or T == float):
            print(error_msg)
            return
        self._nodeArray = self._nodeArray or T == Node
        self._numArray = self._numArray or T == int or T == float

        self._arr.append(obj)
        indx = len(self._arr) - 1  # index of the element we want to bubble up
        self._bubbleUp(indx)

    def change_val(self, obj: Num | Node, new_val: Num):
        '''
        changes the value of the object in the heap. If the object is a number,
        and is repeated in the heap, the first occurrence is changed.
        '''
        try:
            indx = self._arr.index(obj)
        except ValueError:
            print("Object not found")
        else:
            self.change_val_at_indx(indx, new_val)

    def change_val_at_indx(self, indx: int, new_val: Num):
        '''
        changes the value of the object in the heap at the given index.
        Precondition: indx in range and type contracts are met.
        '''

        if type(new_val) not in [int, float]:
            raise ValueError

        if self._numArray:
            self._arr[indx] = new_val
        else:
            self._arr[indx].change_val(new_val)

        if indx != 0 and self._arr[indx] > self._arr[MaxHeap.parent(indx)]:
            self._bubbleUp(indx)

        c1 = MaxHeap.left(indx) < len(self._arr) and self._arr[indx] < \
             self._arr[MaxHeap.left(indx)]
        c2 = MaxHeap.right(indx) < len(self._arr) and self._arr[indx] < \
             self._arr[MaxHeap.right(indx)]
        if c1 or c2:
            self._bubbleDown(indx)

    def _bubbleUp(self, indx: int):
        # could be done recursively as well
        while indx and (child := self._arr[indx]) > (
                parent := self._arr[p_indx := MaxHeap.parent(indx)]):
            self._arr[indx] = parent
            self._arr[p_indx] = child
            indx = p_indx

    def _bubbleDown(self, indx: int):
        left_i, right_i = MaxHeap.left(indx), MaxHeap.right(indx)

        if left_i >= len(self._arr):  # if it has no left or right children.
            return

        child_i = left_i  # unless right node is present & is greater than left
        if right_i < len(self._arr) and self._arr[left_i] < self._arr[right_i]:
            child_i = right_i

        if (parent := self._arr[indx]) < (child := self._arr[child_i]):
            self._arr[indx], self._arr[child_i] = child, parent

        self._bubbleDown(child_i)


# run all doctests
if __name__ == "__main__":
    import doctest

    doctest.testmod()
